
if ENV['PERF_CHECK']
  PerfCheck::Server.authorization_action(:post, '/login') do |login, route|
    session[:user_id] = User.first.id
  end
end
