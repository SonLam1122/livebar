# Su dung base image Node.js 20 Alpine gon nhe va on dinh
FROM node:20-alpine

# Thiet lap moi truong chay production va cong mac dinh
ENV NODE_ENV=production
ENV PORT=3000

# Thiet lap thu muc lam viec ben trong container
WORKDIR /app

# Sao chep file quan ly dependencies de tan dung Docker cache layer
COPY package*.json ./

# Cai dat dependencies che do production
RUN npm ci --omit=dev

# Sao chep toan bo ma nguon va tai nguyen vao container
COPY . .

# Phan quyen thu muc lam viec cho user node de ghi du lieu cau hinh
RUN chown -R node:node /app

# Chuyen sang user khong co quyen root de tang cuong bao mat
USER node

# Mo cong PORT cho ung dung
EXPOSE 3000

# Kiem tra trang thai hoat dong cua server dinh ky
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://localhost:3000/api/screens || exit 1

# Lenh khoi chay server
CMD ["node", "server.js"]

