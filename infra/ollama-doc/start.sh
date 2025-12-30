#!/bin/sh
set -e

OLLAMA_BIN="/usr/bin/ollama"

echo "Starting Ollama server..."
$OLLAMA_BIN serve &

echo "Waiting for Ollama API..."
sleep 10

echo "Pulling llama3.2 if not exists..."
$OLLAMA_BIN pull llama3.2

echo "Ollama is ready."
wait
