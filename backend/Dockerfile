FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
# 這裡複製所有 backend 檔案
COPY . .
RUN dotnet publish "Kanban.API/Kanban.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
ENTRYPOINT ["dotnet", "Kanban.API.dll"]
