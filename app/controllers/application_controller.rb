class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :logged_in?, :except => :login

  def logged_in?
    if session[:user_id].blank?
      render 'application/welcome', :layout => 'logged_out'
      return false
    else
      @current_user = User.find(session[:user_id])
    end
  end

  def login
    user = User.first
    if user.verify(params[:password])
      session[:user_id] = user.id
    end
    redirect_to '/'
  end

  def logout
    session[:user_id] = nil
    redirect_to '/'
  end
end
