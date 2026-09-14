# Script de subida automatica a GitHub (Rama main)
$ErrorActionPreference = "Stop"

$env:Path += ";$env:USERPROFILE\.mingit\cmd"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "  🚀 Subir Portal Tinkus Wistus a GitHub (Rama main)" -ForegroundColor Green
Write-Host "  Destino: https://github.com/JuanPabloZarate/Portal_Wistus" -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si git esta disponible
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
    Write-Host "❌ No se encontro Git. Asegurese de que MinGit o Git este instalado." -ForegroundColor Red
    exit 1
}

# Configurar rama main y remoto
git branch -M main
git remote remove origin 2>$null
git remote add origin https://github.com/JuanPabloZarate/Portal_Wistus.git

# Preguntar por el Personal Access Token si no esta guardado
$token = Read-Host "Introduce tu GitHub Personal Access Token (o presiona Enter para usar credenciales del sistema)"

if ($token -and $token.Trim() -ne "") {
    $cleanToken = $token.Trim()
    $authRemote = "https://${cleanToken}@github.com/JuanPabloZarate/Portal_Wistus.git"
    Write-Host "Enviando cambios a GitHub con autenticacion por Token..." -ForegroundColor Cyan
    git push -u $authRemote main --force
    # Restaurar remote limpio sin exponer el token en .git/config
    git remote set-url origin https://github.com/JuanPabloZarate/Portal_Wistus.git
} else {
    Write-Host "Intentando push directo..." -ForegroundColor Cyan
    git push -u origin main
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ¡SUBIDA EXITOSA A GITHUB!" -ForegroundColor Green
    Write-Host "Visita: https://github.com/JuanPabloZarate/Portal_Wistus" -ForegroundColor White
} else {
    Write-Host "⚠️ Hubo un error al realizar el push. Verifica tu token o permisos en GitHub." -ForegroundColor Red
}
