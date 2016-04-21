require 'rubygems'
require 'open-uri'

class Api::V1::MovieBoxOfficeController < ApplicationController

    MOVIE_PAGE_URL = "http://www.boxofficemojo.com/movies/?page=weekly&id=avatar.htm&sort=date&order=ASC&p=.htm"

    def movie
        render json: movie_year_revenue
    end

    private

    # for #movie
    def movie_year_revenue
      page = Nokogiri::HTML(open(MOVIE_PAGE_URL))

      css_centers = page.css("center")
      movie_tables_container = css_centers[1]
      #unused
      movie_header_table_container = css_centers[0]

      extracted_tables = {}

      table_years = movie_tables_container.css("b font")
      tables = movie_tables_container.css("table")
      0.upto(tables.size - 1) do |idx|
        table = tables[idx]
        year = nil

        if table_years[idx]
          year = table_years[idx].text
        end

        extracted_table = extract_table table
        extracted_tables[year] = extracted_table
      end

      extracted_tables
    end

    def extract_table table_node
        extracted_rows = []
        table_rows = table_node.css("tr")

        # hard to format table col headers from HTML, so used hard coding instead
        #   col_names = extract_col_header_row(table_rows[0])
        col_names = ["Date", "Rank", "Weekly Gross", "% Change", "# of Theaters",
                    "Theater Change", "Average Gross", "Gross to Date", "Week #"]

        1.upto(table_rows.size-1) do |idx|
          row_node = table_rows[idx]
          extracted_rows.push extract_row row_node
        end

      output = {}
      extracted_rows.each do |row|
          json_row = {}
          row.each_with_index do |el, idx|
              json_row[col_names[idx]] = el
          end

          output[json_row["Week #"]] = json_row
      end

      output
    end

    def extract_col_header_row node
        output = []

        if node.name == "td"
            return [extract_col_header_cell(node)]
        elsif node.children.size > 0
            node.children.each do |td|
                output += extract_col_header_row td
            end
        end

        output
    end

    def extract_col_header_cell node
        output = ""

        if node.children.empty?
          if node.class == Nokogiri::XML::Text
            text = node.text.sub("\u0096", "-")
            return text
          end
        elsif node.children.size > 0
          node.children.each do |td|
            output += extract_col_header_cell( td )
          end
        end

        output
    end

    def extract_row node
      output = []

      if node.children.empty?
        if node.class == Nokogiri::XML::Text
          text = node.text.sub("\u0096", "-")
          return [text]
        end
      elsif node.children.size > 0
        node.children.each do |td|
          output += extract_row( td )
        end
      end

      output
    end

end
