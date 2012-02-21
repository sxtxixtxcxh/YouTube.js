guard 'compass' do
  watch(%r{^stylesheets/(.*)\.s[ac]ss})
end

guard 'livereload', :api_version => '1.6' do
  watch(%r{public/.+\.(php|html)})
  # hack because compass bogarts the file change
  watch(%r{^stylesheets/(.+)\.s[ac]ss}) { |m| "public/wp-content/themes/usertesting/stylesheets/#{m[1]}.css" }
end