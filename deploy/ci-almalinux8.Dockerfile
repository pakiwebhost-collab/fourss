FROM almalinux:8.10@sha256:1965cb10f9c392766b2d544d3c1b997eb008d0e413c808e6a20086e87c802a80

RUN dnf -y install bash coreutils glibc-common curl tar gzip xz findutils python3 ca-certificates \
    && dnf clean all
RUN curl -fsSL https://nodejs.org/download/release/v22.23.4/node-v22.23.4-linux-x64.tar.xz -o /tmp/node.tar.xz \
    && echo '1805bcd35e6815559bd2eb97db438d3fdb0eb3a5e6a977b7c1badca76337e9ce  /tmp/node.tar.xz' | sha256sum -c - \
    && tar -xJf /tmp/node.tar.xz --strip-components=1 -C /usr/local \
    && rm /tmp/node.tar.xz \
    && test "$(node -v)" = v22.23.4 \
    && test "$(getconf GNU_LIBC_VERSION)" = 'glibc 2.28'
