@echo off 
start /wait "Test 4.bat" 
REG DELETE "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "4.bat" /t REG_SZ /F /D "4.bat" 
mkdir "Test 4" 
move *.csv "Test 4" 
