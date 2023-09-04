FROM debian:bookworm-20230814
LABEL org.opencontainers.image.authors="vershininyn@yandex.ru"

ARG FINTERRA_WEB_CONTAINER_IPv4_HOST="undefined"
ARG FINTERRA_WEB_CONTAINER_IPv4_PORT="undefined"

ARG FINTERRA_WEB_CONTAINER_DEBIAN_OS_LOCALE="undefined"
ARG FINTERRA_WEB_CONTAINER_DEBIAN_OS_TZ="undefined"

ARG FINTERRA_WEB_CONTAINER_PHP_VERSION="undefined"
ARG FINTERRA_WEB_CONTAINER_PHP_DATA_DIR="undefined"
ARG FINTERRA_WEB_CONTAINER_COMPOSER_VERSION="undefined"

ARG FINTERRA_WEB_CONTAINER_APACHE2_DOCUMENT_ROOT="undefined"
ARG FINTERRA_WEB_CONTAINER_APACHE2_WEB_APP_DIR="undefined"
ARG FINTERRA_WEB_CONTAINER_APACHE2_CONF_DIR="undefined"

ARG FINTERRA_ESCAPED_APACHE2_DOCUMENT_ROOT_TMP_FILE="undefined"

ENV COMPOSER_VERSION=${FINTERRA_WEB_CONTAINER_COMPOSER_VERSION} \
    BUILD_DEPS="software-properties-common" \
    #
    OS_LOCALE=${FINTERRA_WEB_CONTAINER_DEBIAN_OS_LOCALE} \
    LANG=${OS_LOCALE} \
    LANGUAGE=${OS_LOCALE} \
    LC_ALL=${OS_LOCALE} \
    DEBIAN_FRONTEND=noninteractive \
    #
    PHP_VERSION=${FINTERRA_WEB_CONTAINER_PHP_VERSION} \
    PHP_CONF_DIR=/etc/php/${PHP_VERSION} \
    PHP_DATA_DIR=${FINTERRA_WEB_CONTAINER_PHP_DATA_DIR} \
    #
    TZ=${FINTERRA_WEB_CONTAINER_DEBIAN_OS_TZ} \
    #
    APACHE2_IPv4_HOST=${FINTERRA_WEB_CONTAINER_IPv4_HOST} \
    APACHE2_IPv4_PORT=${FINTERRA_WEB_CONTAINER_IPv4_PORT} \
    APACHE2_DOCUMENT_ROOT=${FINTERRA_WEB_CONTAINER_APACHE2_DOCUMENT_ROOT} \
    APACHE2_WEB_APP_DIR=${FINTERRA_WEB_CONTAINER_APACHE2_WEB_APP_DIR} \
    APACHE2_CONF_DIR=${FINTERRA_WEB_CONTAINER_APACHE2_CONF_DIR} \
    #
    DOCKER_ENTRY_POINT="/sbin/entrypoint.sh" \
    #
    ESCAPED_APACHE2_DOCUMENT_ROOT_TMP_FILE=${FINTERRA_ESCAPED_APACHE2_DOCUMENT_ROOT_TMP_FILE} \
    ESCAPED_DOCUMENT_ROOT_ENTRY_POINT="/sbin/get_escaped_path_from_script.sh"

RUN apt-get update  \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
    && apt-get install -y locales  \
    && locale-gen ${OS_LOCALE} \
    && apt-get install -y sudo

RUN sudo mkdir -p ${PHP_DATA_DIR}/ ${APACHE2_WEB_APP_DIR}/ ${APACHE2_DOCUMENT_ROOT}/ ${APACHE2_CONF_DIR}/

RUN rm -rf ${PHP_DATA_DIR}/php-modules.txt
COPY ./conf/php-modules.txt  ${PHP_DATA_DIR}/php-modules.txt

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
    && rm ${APACHE2_CONF_DIR}/sites-enabled/000-default.conf ${APACHE2_CONF_DIR}/sites-available/000-default.conf \
    && a2enmod rewrite php${PHP_VERSION} \
	# Install composer
	&& curl -sS https://getcomposer.org/installer | php -- --version=${COMPOSER_VERSION} --install-dir=/usr/local/bin --filename=composer \
	# Cleaning
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
RUN sed -i "s;#ENV_SERVER_IPv4_HOST#;${APACHE2_IPv4_HOST};g" ${APACHE_CONF_DIR_ENVVARS}
RUN sed -i "s;#ENV_SERVER_IPv4_PORT#;${APACHE2_IPv4_PORT};g" ${APACHE_CONF_DIR_ENVVARS}

#ENV ESCAPED_APACHE2_DOCUMENT_ROOT_TMP_PATH=${PHP_DATA_DIR}/${ESCAPED_APACHE2_DOCUMENT_ROOT_TMP_FILE}
#
#RUN rm -rf ${ESCAPED_APACHE2_DOCUMENT_ROOT_TMP_PATH}  \
#    && touch ${ESCAPED_APACHE2_DOCUMENT_ROOT_TMP_PATH} \
#    && echo ${APACHE2_DOCUMENT_ROOT} > ${ESCAPED_APACHE2_DOCUMENT_ROOT_TMP_PATH} \
#    && sed -i "s;\/;\\\/;g" ${ESCAPED_APACHE2_DOCUMENT_ROOT_TMP_PATH}
#
#RUN rm -rf ${ESCAPED_DOCUMENT_ROOT_ENTRY_POINT}
#COPY ./conf/get_escaped_path_from_script.sh ${ESCAPED_DOCUMENT_ROOT_ENTRY_POINT}
#RUN chmod +x ${ESCAPED_DOCUMENT_ROOT_ENTRY_POINT}
#
#export ESCAPED_APACHE2_DOCUMENT_ROOT_VAR_FROM_SH=$(head -n 1 "$1")

RUN /bin/bash -c "ESCAPED_APACHE2_DOCUMENT_ROOT_VAR="${$ESCAPED_APACHE2_DOCUMENT_ROOT_VAR:-`echo '$APACHE2_DOCUMENT_ROOT' | sed 's;\/;\\\/;g'`}""

RUN sed -i "s;#ENV_SERVER_DOCUMENT_ROOT#;${ESCAPED_APACHE2_DOCUMENT_ROOT_VAR};g" ${APACHE_CONF_DIR_ENVVARS}

RUN rm -rf ${APACHE2_CONF_DIR}/apache2.conf
COPY ./conf/apache2.conf ${APACHE2_CONF_DIR}/apache2.conf

RUN rm -rf ${APACHE2_CONF_DIR}/ports.conf
COPY ./conf/ports.conf ${APACHE2_CONF_DIR}/ports.conf

RUN rm -rf ${APACHE2_CONF_DIR}/sites-enabled/web-app.conf
COPY ./conf/web-app.conf ${APACHE2_CONF_DIR}/sites-enabled/web-app.conf

RUN rm -rf ${PHP_CONF_DIR}/apache2/conf.d/custom.ini
COPY ./conf/php.ini ${PHP_CONF_DIR}/apache2/conf.d/custom.ini

# Expose port's from container
EXPOSE ${APACHE2_IPv4_PORT}

RUN rm -rf ${DOCKER_ENTRY_POINT}
COPY ./conf/entrypoint.sh ${DOCKER_ENTRY_POINT}
RUN chmod +x ${DOCKER_ENTRY_POINT}

WORKDIR ${APACHE2_WEB_APP_DIR}

# By default, simply start apache.
CMD ["${DOCKER_ENTRY_POINT}"]