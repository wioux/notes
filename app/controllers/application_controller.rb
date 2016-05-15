class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :logged_in?, :except => :login

  def logged_in?
    if session[:user_id].blank?
      render "application/welcome", layout: "logged_out", locals: { user: User.new }
      return false
    else
      @current_user = User.find(session[:user_id])
    end
  end

  def login
    user = User.find_by!(login_name: params[:user][:login_name])
    if user.verify(params[:user][:password])
      session[:user_id] = user.id
      redirect_to "/"
    else
      user.errors.add("password", "is incorrect")
      render "application/welcome", layout: "logged_out", locals: { user: user }
    end
  end

  def logout
    session[:user_id] = nil
    redirect_to '/'
  end
end
