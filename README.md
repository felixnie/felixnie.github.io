# Personal Blog Development Kit

## Blogging with Jekyll and GitHub Pages

### Install Jekyll
https://jekyllrb.com/docs/installation/ubuntu/

### Run Hydejack
```
# cd into Hydejack directory
bundle install
bundle exec jekyll serve
# real-time update
bundle exec jekyll serve --force-polling
# if you want to disable some add-on that need subscription
JEKYLL_ENV=production bundle exec jekyll serve
# or when building final version
JEKYLL_ENV=production bundle exec jekyll build
# see https://jekyllrb.com/docs/step-by-step/10-deployment/
```

### Update Hydejack
```
bundle update jekyll-theme-hydejack
```

### If you're using WSL
```
# open in Explorer
explorer.exe .
```

### GitHub commands
```
cd felixnie.github.io
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/felixnie/felixnie.github.io.git
git push -f origin master
# or try main
```
