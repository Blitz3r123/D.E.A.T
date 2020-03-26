@echo off 
start /wait "C:\Users\kalee\Documents\D.E.A.T_Testing\Scripts\Publisher 1.bat" && "C:\Users\kalee\Documents\D.E.A.T_Testing\Scripts\Subscriber 1.bat"
REG ADD "HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" /V "2.bat" /t REG_SZ /F /D "2.bat" 
mkdir "Test 1" 
move *.csv "Test 1"
