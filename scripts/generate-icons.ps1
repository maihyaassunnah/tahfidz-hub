Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\MAIAS\.gemini\antigravity-ide\brain\d4006cd6-a252-42cc-b1c6-808a59d86f26\.user_uploaded\media_1789895876300.jpg"
$destDir = "d:\Tahfidz (Nice)\public\icons"

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
}

$srcImage = [System.Drawing.Image]::FromFile($srcPath)
Write-Output "Source Image Loaded: $($srcImage.Width)x$($srcImage.Height)"

$sizes = @(
    @{ Name = "icon-72x72.png"; Size = 72 },
    @{ Name = "icon-96x96.png"; Size = 96 },
    @{ Name = "icon-128x128.png"; Size = 128 },
    @{ Name = "icon-144x144.png"; Size = 144 },
    @{ Name = "icon-152x152.png"; Size = 152 },
    @{ Name = "icon-192x192.png"; Size = 192 },
    @{ Name = "icon-384x384.png"; Size = 384 },
    @{ Name = "icon-512x512.png"; Size = 512 },
    @{ Name = "apple-touch-icon.png"; Size = 180 },
    @{ Name = "favicon-32x32.png"; Size = 32 },
    @{ Name = "favicon-16x16.png"; Size = 16 }
)

foreach ($item in $sizes) {
    $targetSize = $item.Size
    $destFile = Join-Path $destDir $item.Name
    
    $destBitmap = New-Object System.Drawing.Bitmap $targetSize, $targetSize
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    
    # High quality interpolation and anti-aliasing
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graphics.DrawImage($srcImage, 0, 0, $targetSize, $targetSize)
    
    $destBitmap.Save($destFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $destBitmap.Dispose()
    Write-Output "Generated: $destFile ($($targetSize)x$($targetSize))"
}

# Also copy high-res icon to public root as favicon.png
$destBitmap512 = New-Object System.Drawing.Bitmap 512, 512
$g = [System.Drawing.Graphics]::FromImage($destBitmap512)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.DrawImage($srcImage, 0, 0, 512, 512)
$destBitmap512.Save("d:\Tahfidz (Nice)\public\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$destBitmap512.Save("d:\Tahfidz (Nice)\public\pwa-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$destBitmap512.Save("d:\Tahfidz (Nice)\public\pwa-192x192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$destBitmap512.Dispose()

# Maskable 512x512 with safe area
$maskBmp = New-Object System.Drawing.Bitmap 512, 512
$gm = [System.Drawing.Graphics]::FromImage($maskBmp)
$gm.Clear([System.Drawing.ColorTranslator]::FromHtml('#0a4433'))
$gm.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gm.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$pad = 36
$gm.DrawImage($srcImage, $pad, $pad, 512 - (2 * $pad), 512 - (2 * $pad))
$maskBmp.Save("d:\Tahfidz (Nice)\public\icons\icon-maskable-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$maskBmp.Save("d:\Tahfidz (Nice)\public\icons\icon-maskable-192x192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$gm.Dispose()
$maskBmp.Dispose()

$srcImage.Dispose()
Write-Output "All icons successfully created!"
