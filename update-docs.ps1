Remove-Item -Recurse -Force ./docs
ringo-doc --file-urls -s ./lib/ -d ./docs/ -p package.json -n "Validator API"