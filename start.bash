#!/bin/bash

# Purge all Docker containers
docker rm -f $(docker ps -aq)

# Run docker-compose up --build
docker-compose up --build
