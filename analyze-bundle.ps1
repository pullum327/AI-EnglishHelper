# Bundle 分析腳本 (PowerShell 版本)

Write-Host "📊 Bundle 分析報告" -ForegroundColor Cyan
Write-Host ""

# 檢查 dist 目錄是否存在
if (Test-Path "dist") {
    # 分析 JS chunks
    if (Test-Path "dist/js") {
        Write-Host "📦 JavaScript Chunks:" -ForegroundColor Green
        $jsFiles = Get-ChildItem "dist/js" -File
        $totalJsSize = 0
        
        foreach ($file in $jsFiles) {
            $sizeInKb = [math]::Round($file.Length / 1KB, 2)
            $totalJsSize += $file.Length
            Write-Host "  $($file.Name): $sizeInKb KB"
        }
        
        $totalJsSizeKb = [math]::Round($totalJsSize / 1KB, 2)
        Write-Host ""
        Write-Host "  📊 總 JS 大小: $totalJsSizeKb KB" -ForegroundColor Yellow
    }
    
    # 分析 CSS
    if (Test-Path "dist/css") {
        Write-Host ""
        Write-Host "🎨 CSS 文件:" -ForegroundColor Green
        $cssFiles = Get-ChildItem "dist/css" -File
        $totalCssSize = 0
        
        foreach ($file in $cssFiles) {
            $sizeInKb = [math]::Round($file.Length / 1KB, 2)
            $totalCssSize += $file.Length
            Write-Host "  $($file.Name): $sizeInKb KB"
        }
        
        $totalCssSizeKb = [math]::Round($totalCssSize / 1KB, 2)
        Write-Host ""
        Write-Host "  📊 總 CSS 大小: $totalCssSizeKb KB" -ForegroundColor Yellow
    }
    
    # 分析其他資源
    if (Test-Path "dist/assets") {
        $assetFiles = Get-ChildItem "dist/assets" -File
        if ($assetFiles.Count -gt 0) {
            Write-Host ""
            Write-Host "🖼️ 其他資源:" -ForegroundColor Green
            $totalAssetSize = 0
            
            foreach ($file in $assetFiles) {
                $sizeInKb = [math]::Round($file.Length / 1KB, 2)
                $totalAssetSize += $file.Length
                Write-Host "  $($file.Name): $sizeInKb KB"
            }
            
            $totalAssetSizeKb = [math]::Round($totalAssetSize / 1KB, 2)
            Write-Host ""
            Write-Host "  📊 總資源大小: $totalAssetSizeKb KB" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "💡 優化建議:" -ForegroundColor Magenta
    Write-Host "  1. 考慮使用 dynamic import() 進行更細粒度的代碼分割"
    Write-Host "  2. 檢查是否有未使用的依賴可以移除"
    Write-Host "  3. 考慮使用 tree-shaking 移除未使用的代碼"
    Write-Host "  4. 檢查圖片和字體資源是否可以優化"
    Write-Host "  5. 考慮使用 CDN 來分發靜態資源"
    
} else {
    Write-Host "❌ dist 目錄不存在，請先運行 npm run build" -ForegroundColor Red
}
