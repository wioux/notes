Notes::Application.routes.draw do

  post "/sessions", to: "application#create_session"
  get "/login", to: "application#login"
  get "/logout", to: "application#destroy_session"

  root to: "notes#index"
  get "/autocomplete", to: "notes#autocomplete"
  get "/tags/autocomplete", to: "tags#autocomplete"

  resources :notes do
    collection do
      get "filter"
      get "browse"

      get "tune_widget"
    end
  end
end
