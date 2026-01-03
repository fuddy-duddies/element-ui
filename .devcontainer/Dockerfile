FROM mcr.microsoft.com/devcontainers/javascript-node:14-buster

ARG PYTHON_VERSION=3.9.25

RUN sed -i.bak "s|security.debian.org|archive.debian.org|g" /etc/apt/sources.list
RUN sed -i.bak "s|deb.debian.org|archive.debian.org|g" /etc/apt/sources.list

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y \
    build-essential \
    git \
    make \
    curl \
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

ENV http_proxy="http://10.38.34.162:3128"
ENV https_proxy="http://10.38.34.162:3128"

# Install pyenv
ENV PYENV_ROOT="$HOME/.pyenv"
ENV PATH="${PYENV_ROOT}/shims:${PYENV_ROOT}/bin:${PATH}"
RUN set -ex \
    && curl https://pyenv.run | bash \
    && pyenv update \
    && pyenv install $PYTHON_VERSION \
    && pyenv global $PYTHON_VERSION \
    && pyenv rehash

WORKDIR /workspace/

COPY . /workspace/

ENV CI=true

RUN git config --global core.autocrlf input

RUN npm install -g yarn && yarn global add node-gyp@9

ENV npm_config_node_gyp="$HOME/.config/yarn/global/node_modules/node-gyp/bin/node-gyp.js"

CMD ["echo", "Development container is ready."]
