Notes::Application.routes.draw do

  post '/login', :to => 'application#login'
  get '/logout', :to => 'application#logout'

  root :to => 'notes#browse'

  get '/autocomplete', :to => 'notes#autocomplete'
  get '/tags/autocomplete', :to => 'tags#autocomplete'

  resources :notes, :only => [:new, :create, :update, :show, :destroy] do
    collection do
      patch 'preview'
      get 'filter'
      get 'browse'

      get 'tune_widget'
    end
  end

  resources :attachments, :only => :show
end
