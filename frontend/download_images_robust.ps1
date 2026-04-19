$ErrorActionPreference = "Stop"

function Download-Image {
    param([string]$url, [string]$name)
    Write-Host "Downloading $name ..."
    try {
        $out = "public/images/$name"
        Invoke-WebRequest -Uri $url -OutFile $out -UserAgent "Mozilla/5.0"
    } catch {
        Write-Host "Failed to download $name"
        Write-Host $_
    }
}

$destPath = "public/images"
if (!(Test-Path $destPath)) {
    New-Item -ItemType Directory -Force -Path $destPath | Out-Null
}

Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1280px-Taj_Mahal_%28Edited%29.jpeg" "tajmahal.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Kerala_backwater_20080218-11.jpg/1280px-Kerala_backwater_20080218-11.jpg" "kerala.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Hawa_Mahal_2011.jpg/1280px-Hawa_Mahal_2011.jpg" "hawamahal.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Palolem_Beach%2C_Goa.jpg/1280px-Palolem_Beach%2C_Goa.jpg" "goa.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Varanasi_Ghats.jpg/640px-Varanasi_Ghats.jpg" "varanasi.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Qutb_Minar_2011.jpg/640px-Qutb_Minar_2011.jpg" "qutubminar.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Mumbai_03-2016_30_Gateway_of_India.jpg/640px-Mumbai_03-2016_30_Gateway_of_India.jpg" "gateway.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Mysore_palace_illuminated.jpg/640px-Mysore_palace_illuminated.jpg" "mysore.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Golden_Temple_India.jpg/640px-Golden_Temple_India.jpg" "goldentemple.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Meenakshi_Amman_Temple%2C_Madurai.jpg/640px-Meenakshi_Amman_Temple%2C_Madurai.jpg" "meenakshi.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Red_Fort_in_Delhi_03-2016_img3.jpg/640px-Red_Fort_in_Delhi_03-2016_img3.jpg" "redfort.jpg"
Download-Image "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Stone_Chariot_Hampi.jpg/640px-Stone_Chariot_Hampi.jpg" "hampi.jpg"
