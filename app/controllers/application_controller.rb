class ApplicationController < ActionController::Base
  protect_from_forgery

  before_filter :set_current_user, :except => :login

  attr_reader :current_user
  helper_method :current_user, :logged_in?

  def login
    render "login", layout: "logged_out", locals: { user: User.new }
    return false
  end

  def create_session
    user = User.find_by(login_name: params[:user][:login_name])
    if user.try(:verify, params[:user][:password])
      session[:user_id] = user.id
      redirect_to "/"
    else
      user ||= User.new(login_name: params[:user][:login_name])
      user.errors.add("user name or password", "is incorrect")
      render "login", layout: "logged_out", locals: { user: user }
    end
  end

  def destroy_session
    session[:user_id] = nil
    redirect_to '/'
  end

  protected

  def set_current_user
    unless session[:user_id].blank?
      @current_user = User.find(session[:user_id])
    end
  end

  def logged_in?
    current_user.presence
  end
end
