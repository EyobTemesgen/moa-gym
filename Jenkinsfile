// MoA Staff Wellness & Gym Management System — Automated Intranet Deployment Pipeline
// Builds Docker images on Jenkins and deploys them to on-premises MoA servers via SSH.
pipeline {
    agent { label 'docker' }

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 45, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '30'))
    }

    parameters {
        choice(name: 'TARGET', choices: ['production', 'staging'], description: 'Server to deploy to: production (10.10.20.155) or staging (10.10.20.156)')
        string(name: 'VERSION', defaultValue: '', trim: true, description: 'Release tag to deploy, e.g. v1.0.0. Leave empty for latest main.')
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    environment {
        DEPLOY_HOST = "${params.TARGET == 'staging' ? '10.10.20.156' : '10.10.20.155'}"
        DEPLOY_USER = "${params.TARGET == 'staging' ? 'gyms' : 'gymp'}"
        APP_DIR     = '/opt/moa-gym'
        APP_IMAGES  = 'moa-gym-backend:latest moa-gym-nginx:latest'
        SSH_OPTS    = '-o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30'
        POSTGRES_PASSWORD = 'build-only'
        JWT_SECRET        = 'build-only-secret-key-at-least-32-chars-long'
    }

    stages {
        stage('Select Version') {
            steps {
                script {
                    def version = (params.VERSION ?: '').trim()
                    if (version && !version.matches(/v\d+\.\d+\.\d+/)) {
                        error("VERSION must look like v1.0.0, not '${version}'.")
                    }
                    if (version) {
                        sh 'git fetch --tags --force origin'
                        if (sh(returnStatus: true, script: "git rev-parse -q --verify 'refs/tags/${version}^{commit}' >/dev/null") != 0) {
                            error("Release ${version} does not exist on Git remote. Please push tag first.")
                        }
                        sh "git checkout -q --detach 'refs/tags/${version}^{commit}'"
                    }
                    env.APP_VERSION = version ?: 'main'
                    currentBuild.displayName = "#${env.BUILD_NUMBER} ${params.TARGET ?: 'production'} ${env.APP_VERSION}"
                }
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                    export APP_COMMIT=$(git rev-parse --short HEAD)
                    echo "Building MoA Gym $APP_VERSION ($APP_COMMIT)"
                    docker compose -p moa-gym-ci build --pull
                    docker image ls --format '{{.Repository}}:{{.Tag}}  {{.Size}}' | grep '^moa-gym-'
                '''
            }
        }

        stage('Backup Database') {
            steps {
                sshagent(['moa-gym-deploy-ssh']) {
                    sh '''
                        ssh $SSH_OPTS "$DEPLOY_USER@$DEPLOY_HOST" "
                            cd $APP_DIR && mkdir -p backups &&
                            if docker compose ps --services --status running | grep -qx db; then
                                f=backups/pre-deploy-\$(date +%F_%H%M%S).dump &&
                                docker compose exec -T db pg_dump -U moa_gym_user -Fc moa_gym_db > \$f &&
                                ls -lh \$f &&
                                find backups -name 'pre-deploy-*.dump' -mtime +30 -delete;
                            else
                                echo 'Database not yet running (first deploy): skipping pre-deploy backup';
                            fi
                        "
                    '''
                }
            }
        }

        stage('Send Images') {
            steps {
                sshagent(['moa-gym-deploy-ssh']) {
                    sh '''
                        TARGET_SSH="$DEPLOY_USER@$DEPLOY_HOST"

                        # Keep current version as :previous for instant one-command rollback
                        ssh $SSH_OPTS "$TARGET_SSH" '
                            for i in moa-gym-backend moa-gym-nginx; do
                                docker image inspect $i:latest >/dev/null 2>&1 && docker tag $i:latest $i:previous || true
                            done
                        '

                        # Stream compressed images over SSH directly into target docker daemon
                        docker save $APP_IMAGES | gzip -1 | ssh $SSH_OPTS "$TARGET_SSH" 'gunzip | docker load'

                        # Send PostgreSQL image if not present on remote server
                        DB_IMAGE=$(docker compose config --images | grep '^postgres')
                        if ! ssh $SSH_OPTS "$TARGET_SSH" "docker image inspect $DB_IMAGE" >/dev/null 2>&1; then
                            docker pull "$DB_IMAGE"
                            docker save "$DB_IMAGE" | gzip -1 | ssh $SSH_OPTS "$TARGET_SSH" 'gunzip | docker load'
                        fi

                        # Sync production docker-compose.yml configuration
                        scp $SSH_OPTS docker-compose.yml "$TARGET_SSH:$APP_DIR/docker-compose.yml"
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(['moa-gym-deploy-ssh']) {
                    sh '''
                        ssh $SSH_OPTS "$DEPLOY_USER@$DEPLOY_HOST" "
                            cd $APP_DIR &&
                            docker compose up -d --no-build --remove-orphans &&
                            docker image prune -f
                        "
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                sshagent(['moa-gym-deploy-ssh']) {
                    sh '''
                        ssh $SSH_OPTS "$DEPLOY_USER@$DEPLOY_HOST" '
                            for i in $(seq 1 24); do
                                if curl -skf https://localhost/api/health; then
                                    echo ""
                                    echo " MoA Gym Deployment is healthy and responsive!"
                                    exit 0
                                fi
                                sleep 5
                            done
                            echo " Health check failed: API did not respond after 2 minutes."
                            exit 1
                        '
                    '''
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        failure {
            echo " Deployment of MoA Gym failed. Review the logs above."
        }
    }
}
