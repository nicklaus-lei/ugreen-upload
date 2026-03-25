# 使用当前更稳定的 LTS 版本 (Node 22)
FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 为了加速构建，先复制依赖定义文件
# package*.json 会同时匹配 package.json 和 package-lock.json (如果存在)
COPY package*.json ./

# 1. 设置 npm 镜像源（可选，防止 GitHub Actions 网络波动）
# 2. 安装构建工具（应对某些依赖可能需要的 C++ 编译）
# 3. 安装生产依赖
# 4. 安装完后清理缓存和工具减小体积
RUN npm config set registry https://registry.npmmirror.com && \
    apk add --no-cache python3 make g++ && \
    npm install --omit=dev && \
    apk del python3 make g++ && \
    rm -rf /root/.npm

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["node", "server.js"]
