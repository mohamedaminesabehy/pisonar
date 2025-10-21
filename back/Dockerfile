# back/Dockerfile
FROM node:18

# 1) System deps: python3 + venv + pip
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      python3 python3-venv python3-pip python-is-python3 && \
    rm -rf /var/lib/apt/lists/*

# 2) Create and activate a venv for pip
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# 3) Copy entire project (including package.json, package-lock.json, node_modules if present)
COPY . .

# 4) Nuke any stale modules & lock file, then install cleanly
RUN rm -rf node_modules package-lock.json && \
    npm install && \
    npm rebuild bcrypt --build-from-source

# 5) Install your Python libraries into the venv
RUN pip install --no-cache-dir \
      numpy pandas scikit-learn xgboost \
      sentence-transformers rapidfuzz langdetect \
      pymongo hf_xet \
      torch torchvision \
      --extra-index-url https://download.pytorch.org/whl/cpu


EXPOSE 3006

# 6) Start your Node app
CMD ["npm", "start"]
