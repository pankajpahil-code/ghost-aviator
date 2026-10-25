param([string]$InDir,[string]$OutDir,[int]$From,[int]$To)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null=[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]
$null=[Windows.Media.Ocr.OcrEngine,Windows.Foundation,ContentType=WindowsRuntime]
$null=[Windows.Graphics.Imaging.BitmapDecoder,Windows.Foundation,ContentType=WindowsRuntime]
$asTask=([System.WindowsRuntimeSystemExtensions].GetMethods()|?{$_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'})[0]
function Await($op,[Type]$t){ $task=$asTask.MakeGenericMethod($t).Invoke($null,@($op)); $task.Wait(-1)|Out-Null; $task.Result }
$eng=[Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
for($p=$From;$p -le $To;$p++){
  $png=Join-Path $InDir ("pg{0:D3}.png" -f $p); $out=Join-Path $OutDir ("w{0:D3}.txt" -f $p)
  if(!(Test-Path $png) -or (Test-Path $out)){continue}
  $f=Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($png)) ([Windows.Storage.StorageFile])
  $s=Await ($f.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
  $d=Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($s)) ([Windows.Graphics.Imaging.BitmapDecoder])
  $b=Await ($d.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
  $r=Await ($eng.RecognizeAsync($b)) ([Windows.Media.Ocr.OcrResult])
  $lines=@($r.Lines | % { $w=@($_.Words)[0]; "" + [int]$w.BoundingRect.X + "`t" + [int]$w.BoundingRect.Y + "`t" + $_.Text })
  [IO.File]::WriteAllLines($out,[string[]]$lines,[Text.Encoding]::UTF8)
  $s.Dispose()
  "done $p"
}
