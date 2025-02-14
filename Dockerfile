FROM php:8.0-apache

# Instalar as extensões necessárias
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Habilitar o mod_rewrite do Apache (opcional, útil para WordPress)
RUN a2enmod rewrite
