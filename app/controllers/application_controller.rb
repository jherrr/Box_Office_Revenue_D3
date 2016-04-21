class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

    # Always Calculate if caching is disabled
    # Calculate the result if key not present and store in Memcache
    # Return calculated result from Memcache if key is present

    def data_cache(key, time=30.minutes)

        return yield if caching_disabled?
            output = Rails.cache.fetch(key, {expires_in: time}) do

            yield
        end

        return output
        rescue
        # Execute the block if any error with Memcache

        return yield
    end

    def caching_disabled?
        ActionController::Base.perform_caching.blank?
    end

end
