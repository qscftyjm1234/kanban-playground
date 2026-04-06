# 第一階段：編譯環境 (Build Stage)
# 使用包含完整編譯工具的 SDK 7.0 映像檔，別名為 "build"
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src

# 複製 backend 資料夾下的所有程式碼到容器的 /src 目錄
COPY . .

# 執行發佈命令：編譯專案、優化效能，並將產出結果放進 /app/publish 資料夾
RUN dotnet publish "Kanban.API/Kanban.API.csproj" -c Release -o /app/publish

# 第二階段：執行環境 (Final Runtime Stage)
# 使用只包含「執行環境」的輕量級 aspnet 7.0 映像檔，確保最終映像檔體積最小
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS final
WORKDIR /app

# 從 "build" 階段把剛才編譯好的 /app/publish 資料夾內容複製過來
COPY --from=build /app/publish .

# 設定環境變數與對外連接埠 (Port 80)
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

# 啟動命令：告訴 Docker 啟動時直接執行 Kanban.API.dll
ENTRYPOINT ["dotnet", "Kanban.API.dll"]

