Rails.application.routes.draw do

  root to: 'pages#main'
  get "test", to: 'pages#weekly'

    namespace :api do
        namespace :v1, default: {format: :json} do
            get "box_office/week", to: "weekly_box_office#week"
            get "movies/list", to: "movies#list"
            get "box_office/movie", to: "movie_box_office#movie"
        end
    end

end
