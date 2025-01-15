# Personal Blog Development Kit

Modified from https://github.com/hydecorp/hydejack-starter-kit

### Install Jekyll and Bundler
https://jekyllrb.com/docs/installation/ubuntu/

### Hydejack development
If you want to use the local version of Hydejack, check Gemfile:
```
# gem "jekyll-theme-hydejack", "~> 9.0"
gem "jekyll-theme-hydejack", path: "../hydejack"
```

### Run Hydejack starter kit
```
# cd into directory with Gemfile
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

### Manually host on GitHub Pages
```
# copy the contents in `_site` to `felixnie.github.io`
# keep files like CNAME `google2366b5e702dfe483.html`

cd felixnie.github.io
git init
git add .
git commit -m "first commit"
git remote add origin https://github.com/felixnie/felixnie.github.io.git
git push -f origin master
# or try main
```
