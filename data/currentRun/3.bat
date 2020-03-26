@echo off 
start /wait "Test 3.bat" 
REG DELETE "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "3.bat"
REG ADD "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "4.bat" /t REG_SZ /F /D "4.bat" 
mkdir "Test 3" 
move *.csv "Test 3" 
pause 
shutdown -r -t 0 
