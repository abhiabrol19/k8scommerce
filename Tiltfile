print("""
-----------------------------------------------------------------
                     Tilt Initialized...
-----------------------------------------------------------------
""".strip())

# Event Bus Service
k8s_yaml(['infra/k8s/nats-depl.yaml'])

# Imgress Resources
k8s_yaml(['infra/k8s/ingress-srv.yaml', 'infra/k8s/ingress-external-svc.yaml'])

# Authentication Service
docker_build('abhiabrol/auth',
             context='./auth',
             live_update=[
                # Sync files from host to container
                sync('./auth', '/src/'),
             ]
)

k8s_yaml(['infra/k8s/auth-depl.yaml', 'infra/k8s/auth-mongo-depl.yaml'])

# Product Service
docker_build('abhiabrol/products',
             context='./products',
             live_update=[
                # Sync files from host to container
                sync('./products', '/src/'),
             ]
)

k8s_yaml(['infra/k8s/products-depl.yaml', 'infra/k8s/products-mongo-depl.yaml'])

# Order Service
docker_build('abhiabrol/orders',
             context='./orders',
             live_update=[
                # Sync files from host to container
                sync('./orders', '/src/'),
             ]
)

k8s_yaml(['infra/k8s/orders-depl.yaml', 'infra/k8s/orders-mongo-depl.yaml'])

# Expiration Service
docker_build('abhiabrol/expiration',
             context='./expiration',
             live_update=[
                # Sync files from host to container
                sync('./expiration', '/src/'),
             ]
)

k8s_yaml(['infra/k8s/expiration-depl.yaml', 'infra/k8s/expiration-redis-depl.yaml'])

# Payment Service
docker_build('abhiabrol/payments',
             context='./payments',
             live_update=[
                # Sync files from host to container
                sync('./payments', '/src/'),
             ]
)

k8s_yaml(['infra/k8s/payments-depl.yaml', 'infra/k8s/payments-mongo-depl.yaml'])

# Frontend Service
# docker_build('abhiabrol/client',
#              context='./client',
#              live_update=[
#                 # Sync files from host to container
#                 sync('./client', '/'),
#              ]
# )

# k8s_yaml(['infra/k8s/client-depl.yaml'])


# Customize a Kubernetes resource
#   By default, Kubernetes resource names are automatically assigned
#   based on objects in the YAML manifests, e.g. Deployment name.
#
#   Tilt strives for sane defaults, so calling k8s_resource is
#   optional, and you only need to pass the arguments you want to
#   override.
#
#   More info: https://docs.tilt.dev/api.html#api.k8s_resource
#
# k8s_resource('my-deployment',
#              # map one or more local ports to ports on your Pod
#              port_forwards=['5000:8080'],
#              # change whether the resource is started by default
#              auto_init=False,
#              # control whether the resource automatically updates
#              trigger_mode=TRIGGER_MODE_MANUAL
# )


# Run local commands
#   Local commands can be helpful for one-time tasks like installing
#   project prerequisites. They can also manage long-lived processes
#   for non-containerized services or dependencies.
#
#   More info: https://docs.tilt.dev/local_resource.html
#
# local_resource('install-helm',
#                cmd='which helm > /dev/null || brew install helm',
#                # `cmd_bat`, when present, is used instead of `cmd` on Windows.
#                cmd_bat=[
#                    'powershell.exe',
#                    '-Noninteractive',
#                    '-Command',
#                    '& {if (!(Get-Command helm -ErrorAction SilentlyContinue)) {scoop install helm}}'
#                ]
# )


# Extensions are open-source, pre-packaged functions that extend Tilt
#
#   More info: https://github.com/tilt-dev/tilt-extensions
#
# load('ext://git_resource', 'git_checkout')


# # Organize logic into functions
# #   Tiltfiles are written in Starlark, a Python-inspired language, so
# #   you can use functions, conditionals, loops, and more.
# #
# #   More info: https://docs.tilt.dev/tiltfile_concepts.html
# #
# def tilt_demo():
#     # Tilt provides many useful portable built-ins
#     # https://docs.tilt.dev/api.html#modules.os.path.exists
#     if os.path.exists('tilt-avatars/Tiltfile'):
#         # It's possible to load other Tiltfiles to further organize
#         # your logic in large projects
#         # https://docs.tilt.dev/multiple_repos.html
#         load_dynamic('tilt-avatars/Tiltfile')
#     watch_file('tilt-avatars/Tiltfile')
#     git_checkout('https://github.com/tilt-dev/tilt-avatars.git',
#                  checkout_dir='tilt-avatars')


# # Edit your Tiltfile without restarting Tilt
# #   While running `tilt up`, Tilt watches the Tiltfile on disk and
# #   automatically re-evaluates it on change.
# #
# #   To see it in action, try uncommenting the following line with
# #   Tilt running.
# # tilt_demo()
