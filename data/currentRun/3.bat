@echo off 
start /wait "Test 4.bat" 
REG DELETE "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "3.bat" /t REG_SZ /F /D "3.bat" 
mkdir "Test 4" 
move *.csv "Test 4" 
