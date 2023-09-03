FROM debian:bookworm-20230814
MAINTAINER vyn <vershininyn@yandex.ru>

ENV OS_LOCALE="en_US.UTF-8" \
    LANG=${OS_LOCALE} \
    LANGUAGE=${OS_LOCALE} \
    LC_ALL=${OS_LOCALE} \
    DEBIAN_FRONTEND=noninteractive \
    APACHE_CONF_DIR=/etc/apache2 \
    PHP_CONF_DIR=/etc/php/8.2 \
    PHP_DATA_DIR=/var/lib/php/ \
    TZ=Europe/Moscow

RUN \
    apt-get update  \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
    && apt-get install -y locales  \
    && locale-gen ${OS_LOCALE}

RUN mkdir /var/www/web-app/

COPY ./web-app /var/www/web-app/
COPY ./conf/entrypoint.sh /sbin/entrypoint.sh
COPY ./conf/php-modules.txt /var/www/web-app/php-modules.txt

RUN	\
    BUILD_DEPS='software-properties-common' \
    PHP_VERSION='8.2' \
    COMPOSER_VERSION='2.6.1' \
    && apt-get install --no-install-recommends -y $BUILD_DEPS \
    #
    && dpkg-reconfigure locales \
    && apt-get update \
    && apt-get install -y sudo apt-transport-https lsb-release ca-certificates curl wget dirmngr gnupg vim \
    #
    && curl -sSL https://packages.sury.org/php/README.txt | sudo bash -x \
    && curl -sSL https://packages.sury.org/apache2/README.txt | sudo bash -x \
    && apt-get update \
    #
    && apt-get install -y apache2-utils apache2 libapache2-mod-php8.2 php-pear php$PHP_VERSION \
    && sed -i "s/#/php$PHP_VERSION-/g" /var/www/web-app/php-modules.txt && xargs -a /var/www/web-app/php-modules.txt apt-get install -y \
    #&& apt-get install -y php$PHP_VERSION-cli php$PHP_VERSION-readline php$PHP_VERSION-mbstring \
    #&& apt-get install -y php$PHP_VERSION-zip php$PHP_VERSION-intl php$PHP_VERSION-xml php$PHP_VERSION-json  \
    #&& apt-get install -y php$PHP_VERSION-curl php$PHP_VERSION-gd php$PHP_VERSION-pgsql\
    # Apache settings
    && cp /dev/null ${APACHE_CONF_DIR}/conf-available/other-vhosts-access-log.conf \
    && rm ${APACHE_CONF_DIR}/sites-enabled/000-default.conf ${APACHE_CONF_DIR}/sites-available/000-default.conf \
    && a2enmod rewrite php8.2 \
	# Install composer
	&& curl -sS https://getcomposer.org/installer | php -- --version=$COMPOSER_VERSION --install-dir=/usr/local/bin --filename=composer \
	# Cleaning
	&& apt-get purge -y --auto-remove $BUILD_DEPS \
	&& apt-get autoremove -y \
	&& rm -rf /var/lib/apt/lists/* \
	# Forward request and error logs to docker log collector
	&& ln -sf /dev/stdout /var/log/apache2/access.log \
	&& ln -sf /dev/stderr /var/log/apache2/error.log \
	&& chmod 755 /sbin/entrypoint.sh \
	&& chown www-data:www-data ${PHP_DATA_DIR} -Rf \
    && service apache2 stop

RUN rm -rf /var/www/web-app/php-modules.txt

COPY ./conf/apache2.conf ${APACHE_CONF_DIR}/apache2.conf
COPY ./conf/web-app.conf ${APACHE_CONF_DIR}/sites-enabled/web-app.conf
COPY ./conf/php.ini ${PHP_CONF_DIR}/apache2/conf.d/custom.ini

WORKDIR /var/www/web-app/

#RUN useradd -m finterra_yii2 && echo "finterra_yii2:finterra_yii2" | chpasswd && adduser finterra_yii2 sudo

# Expose port's from container
EXPOSE 8282 443

# By default, simply start apache.
CMD ["/sbin/entrypoint.sh"]