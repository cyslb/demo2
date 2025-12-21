# 启动本地HTTP服务器的PowerShell脚本
$port = 8003
$pythonPath = Get-Command python -ErrorAction SilentlyContinue

if ($pythonPath) {
    Write-Host "使用Python启动HTTP服务器在端口$port..."
    python -m SimpleHTTPServer $port
} else {
    $python3Path = Get-Command python3 -ErrorAction SilentlyContinue
    if ($python3Path) {
        Write-Host "使用Python3启动HTTP服务器在端口$port..."
        python3 -m http.server $port
    } else {
        Write-Host "未找到Python或Python3，请确保已安装并添加到环境变量中。"
        exit 1
    }
}