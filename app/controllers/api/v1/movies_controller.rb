require 'net/http'
require 'json'

class Api::V1::MoviesController < ApplicationController

    def list
        list = params[:list]
        output = {}

        list.each do |title|
            movie = Movie.find_by(title: title)
            data = {}

            if movie
                data = movie.api_data
            else
                data = api_request title
                movie = Movie.new(title: title, api_data: data)
                movie.save!
            end

            output[title] = data
        end

        render json: output
    end

    private

    def api_request title
        title_query_str = URI.encode_www_form([["t",title]])

        response = data_cache(title_query_str) do

          url = URI.parse("http://www.omdbapi.com/?#{title_query_str}&y=&plot=short&r=json&type=movie")
          puts url
          req = Net::HTTP::Get.new(url.to_s)

          res = Net::HTTP.start(url.host, url.port, :use_ssl => url.scheme == 'https') {|http|
            http.request(req)
          }

          res
        end

        JSON.parse(response.body)
    end

end
