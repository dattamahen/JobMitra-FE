@echo off
echo Building Angular app (dev configuration)...
call ng build --configuration=dev
if %errorlevel% neq 0 (
    echo Build failed!
    exit /b 1
)

echo Uploading to GCS...
gcloud storage cp -r dist\tech-profile\browser\* gs://dev.jobmouka.com/ --project=jobmouka

echo Done! https://dev.jobmouka.com
