Notes::Application.routes.draw do

  post '/login', :to => 'application#login'
  get '/logout', :to => 'application#logout'

  root :to => 'notes#index'

  get '/autocomplete', :to => 'notes#autocomplete'
  get '/tags/autocomplete', :to => 'tags#autocomplete'

  resources :notes do
    collection do
      get 'filter'
      get 'browse'

      get 'tune_widget'
    end
  end

  resources :attachments, :only => :show

  resources :saved_filters, only: [:create, :destroy]
end
