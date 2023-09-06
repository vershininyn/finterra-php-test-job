FROM debian:bookworm-20230814
LABEL org.opencontainers.image.authors="vershininyn@yandex.ru"

ARG FINTERRA_WEB_CONTAINER_IPv4_HOST="undefined"

ARG FINTERRA_WEB_CONTAINER_DEBIAN_OS_LOCALE="undefined"
ARG FINTERRA_WEB_CONTAINER_DEBIAN_OS_TZ="undefined"

ARG FINTERRA_WEB_CONTAINER_PHP_VERSION="undefined"
ARG FINTERRA_WEB_CONTAINER_PHP_DATA_DIR="undefined"

ARG FINTERRA_WEB_CONTAINER_APACHE2_CONF_DIR="undefined"
ARG FINTERRA_WEB_CONTAINER_APACHE2_DOCUMENT_ROOT="undefined"

ARG FINTERRA_WEB_CONTAINER_APACHE2_SERVER_IPv4_YII2_FRONTEND_PORT="undefined"
ARG FINTERRA_WEB_CONTAINER_APACHE2_SERVER_IPv4_YII2_BACKEND_PORT="undefined"

ARG FINTERRA_WEB_CONTAINER_APACHE2_YII2_FRONTEND_FROM_ROOT_PATH="undefined"
ARG FINTERRA_WEB_CONTAINER_APACHE2_YII2_BACKEND_FROM_ROOT_PATH="undefined"

ENV PHP_VERSION=${FINTERRA_WEB_CONTAINER_PHP_VERSION} \
    OS_LOCALE=${FINTERRA_WEB_CONTAINER_DEBIAN_OS_LOCALE} \
    APACHE2_IPv4_HOST=${FINTERRA_WEB_CONTAINER_IPv4_HOST}

ENV BUILD_DEPS="software-properties-common" \
    LANG=${OS_LOCALE} \
    LANGUAGE=${OS_LOCALE} \
    LC_ALL=${OS_LOCALE} \
    DEBIAN_FRONTEND=noninteractive \
    #
    PHP_CONF_DIR=/etc/php/${PHP_VERSION} \
    PHP_DATA_DIR=${FINTERRA_WEB_CONTAINER_PHP_DATA_DIR} \
    #
    TZ=${FINTERRA_WEB_CONTAINER_DEBIAN_OS_TZ} \
    #
    DOCKER_ENTRY_POINT="/sbin/entrypoint.sh" \
    #
    APACHE2_DOCUMENT_ROOT=${FINTERRA_WEB_CONTAINER_APACHE2_DOCUMENT_ROOT} \
    APACHE2_CONF_DIR=${FINTERRA_WEB_CONTAINER_APACHE2_CONF_DIR}

ENV APACHE2_YII2_FRONTEND_FROM_ROOT_ABSOLUTE_PATH=${APACHE2_DOCUMENT_ROOT}/${FINTERRA_WEB_CONTAINER_APACHE2_YII2_FRONTEND_FROM_ROOT_PATH} \
    APACHE2_YII2_BACKEND_FROM_ROOT_ABSOLUTE_PATH=${APACHE2_DOCUMENT_ROOT}/${FINTERRA_WEB_CONTAINER_APACHE2_YII2_BACKEND_FROM_ROOT_PATH} \
    #
    APACHE2_SERVER_IPv4_YII2_FRONTEND_PORT=${FINTERRA_WEB_CONTAINER_APACHE2_SERVER_IPv4_YII2_FRONTEND_PORT} \
    APACHE2_SERVER_IPv4_YII2_BACKEND_PORT=${FINTERRA_WEB_CONTAINER_APACHE2_SERVER_IPv4_YII2_BACKEND_PORT}

RUN apt-get update  \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone \
    && apt-get install -y locales  \
    && locale-gen ${OS_LOCALE} \
    && apt-get install -y sudo

RUN sudo mkdir -p ${PHP_DATA_DIR}/  \
    ${APACHE2_CONF_DIR}/  \
    ${APACHE2_DOCUMENT_ROOT}/ \
    ${APACHE2_YII2_FRONTEND_FROM_ROOT_ABSOLUTE_PATH}/  \
    ${APACHE2_YII2_BACKEND_FROM_ROOT_ABSOLUTE_PATH}/

RUN rm -rf ${PHP_DATA_DIR}/php-modules.txt
COPY ./conf/php-modules.txt  ${PHP_DATA_DIR}/php-modules.txt

#RUN rm -rf ${APACHE2_DOCUMENT_ROOT}/*
#RUN ln -snf ../yii2-web-app ./yii2-web-app \
#COPY ./yii2-web-app/* ${APACHE2_DOCUMENT_ROOT}/*

RUN	apt-get install --no-install-recommends -y ${BUILD_DEPS} \
    #
    && dpkg-reconfigure locales \
    && apt-get update \
    && apt-get install -y apt-transport-https lsb-release ca-certificates curl wget dirmngr gnupg vim \
    #
    && curl -sSL https://packages.sury.org/php/README.txt | sudo bash -x \
    && curl -sSL https://packages.sury.org/apache2/README.txt | sudo bash -x \
    && apt-get update \
    #
    && apt-get install -y apache2-utils apache2 libapache2-mod-php${PHP_VERSION} php-pear php${PHP_VERSION} \
    && sed -i "s;#;php${PHP_VERSION}-;g" ${PHP_DATA_DIR}/php-modules.txt && xargs -a ${PHP_DATA_DIR}/php-modules.txt apt-get install -y \
    # Apache settings
    && cp /dev/null ${APACHE2_CONF_DIR}/conf-available/other-vhosts-access-log.conf \
    && rm -rf ${APACHE2_CONF_DIR}/sites-enabled/000-default.conf ${APACHE2_CONF_DIR}/sites-available/000-default.conf \
    && a2enmod rewrite php${PHP_VERSION} \
    #
	&& apt-get purge -y --auto-remove ${BUILD_DEPS} \
	&& apt-get autoremove -y \
	&& rm -rf /var/lib/apt/lists/* \
    && rm -rf ${PHP_DATA_DIR}/php-modules.txt \
	# Forward request and error logs to docker log collector
	&& ln -sf /dev/stdout /var/log/apache2/access.log \
	&& ln -sf /dev/stderr /var/log/apache2/error.log \
	&& chown www-data:www-data ${PHP_DATA_DIR}/ -Rf \
    && service apache2 stop

RUN rm -rf ${APACHE2_CONF_DIR}/envvars
COPY ./conf/envvars ${APACHE2_CONF_DIR}/envvars

ENV APACHE_CONF_DIR_ENVVARS=${APACHE2_CONF_DIR}/envvars

#RUN unset ESCAPED_APACHE2_DOCUMENT_ROOT_VAR  \
#    && set ${APACHE2_DOCUMENT_ROOT} 's;\/;\\\/;g'  \
#    && /bin/bash -c "ESCAPED_APACHE2_DOCUMENT_ROOT_VAR=${ESCAPED_APACHE2_DOCUMENT_ROOT_VAR:=`echo "$1" | sed "$2"`}" \
#    && set --

RUN sed -i "s;#ENV_SERVER_IPv4_HOST#;${APACHE2_IPv4_HOST};g" ${APACHE_CONF_DIR_ENVVARS}

RUN sed -i "s;#ENV_APACHE2_SERVER_IPv4_YII2_FRONTEND_PORT#;${APACHE2_SERVER_IPv4_YII2_FRONTEND_PORT};g" ${APACHE_CONF_DIR_ENVVARS}
RUN sed -i "s;#ENV_APACHE2_SERVER_IPv4_YII2_BACKEND_PORT#;${APACHE2_SERVER_IPv4_YII2_BACKEND_PORT};g" ${APACHE_CONF_DIR_ENVVARS}

RUN sed -i "s;#ENV_APACHE2_YII2_FRONTEND_PATH#;${APACHE2_YII2_FRONTEND_FROM_ROOT_ABSOLUTE_PATH};g" ${APACHE_CONF_DIR_ENVVARS}
RUN sed -i "s;#ENV_APACHE2_YII2_BACKEND_PATH#;${APACHE2_YII2_BACKEND_FROM_ROOT_ABSOLUTE_PATH};g" ${APACHE_CONF_DIR_ENVVARS}

RUN rm -rf ${APACHE2_CONF_DIR}/apache2.conf
COPY ./conf/apache2.conf ${APACHE2_CONF_DIR}/apache2.conf

RUN rm -rf ${APACHE2_CONF_DIR}/ports.conf
COPY ./conf/ports.conf ${APACHE2_CONF_DIR}/ports.conf

RUN rm -rf ${APACHE2_CONF_DIR}/sites-enabled/yii2-web-app.conf
COPY ./conf/yii2-web-app.conf ${APACHE2_CONF_DIR}/sites-enabled/yii2-web-app.conf

RUN rm -rf ${PHP_CONF_DIR}/apache2/conf.d/custom.ini
COPY ./conf/php.ini ${PHP_CONF_DIR}/apache2/conf.d/custom.ini

# Expose port's from container
EXPOSE ${APACHE2_SERVER_IPv4_YII2_FRONTEND_PORT}
EXPOSE ${APACHE2_SERVER_IPv4_YII2_BACKEND_PORT}

RUN rm -rf ${DOCKER_ENTRY_POINT}
COPY ./conf/entrypoint.sh ${DOCKER_ENTRY_POINT}
RUN chmod 777 ${DOCKER_ENTRY_POINT}

WORKDIR ${APACHE2_DOCUMENT_ROOT}

# By default, simply start apache.
CMD ["/sbin/entrypoint.sh"]