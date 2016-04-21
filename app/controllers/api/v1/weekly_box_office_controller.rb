require 'rubygems'
require 'open-uri'

class Api::V1::WeeklyBoxOfficeController < ApplicationController

    def week
        year = params[:year].to_i
        week = params[:week].to_i
        weekly_page_url = "http://www.boxofficemojo.com/weekly/chart/?yr=#{year}&wk=#{week}&p=.htm"

        weekly_data = WeeklyRevenue.find_by year: year, week: week
        output = {}

        if weekly_data
            output = weekly_data.api_data
        else
            page = Nokogiri::HTML(open(weekly_page_url))
            table = page.css("center table table")[0]

            massage_HTML_doc table

            table_rows = table.css("tr")

            # "TW" col is prob "This week's rank", "LW" col is prob "Last week's rank"
            col_names = ["Rank This Week", "Rank Last Week", "Title", "Studio", "Weekly Gross",
                        "% Change", "Theater Count", "Theater Change", "Theater Average Gross",
                        "Total Gross", "Budget", "Week #"]
            key = "Rank This Week"
            exclude_rows = [0, table_rows.size-1]

            extracted_table = extract_table( table_rows, col_names, key, exclude_rows )

            total_col_names = ["Total Movie #", "Total Revenue", "Total % Change",
                        "Total Theater Count", "Total Theater Change",
                         "Total Theater Average Gross"]

            output["data"] = extracted_table
            #add total revenue in different format
            output["total"] = extract_total table_rows, total_col_names

            weekly_data = WeeklyRevenue.new(year: year, week: week, api_data: output)
            weekly_data.save!
        end

        render json: output
    end

    #for side effects
    def massage_HTML_doc table_node
        #replace <a> tags
        a_nodes = table_node.css("a")
        a_nodes.each do |node|
            node.replace(node.text)
        end

        #remove text nodes w/ "\r\n"
        carriage_return_nodes = table_node.search("//child::text()[contains(.,'\r\n')]")
        carriage_return_nodes.each do |node|
            node.remove
        end
    end

    def extract_total table_rows, col_names
        output = {}

        total = extract_row( table_rows.last )
        0.upto(col_names.size - 1) do |idx|
            output[col_names[idx]] = total[idx]
        end

        output
    end

    # hard to format table col headers from HTML, so used hard coding instead
    def extract_table table_rows, col_names, key, exclude_rows
        extracted_rows = []

        0.upto(table_rows.size-1) do |idx|
            unless exclude_rows.include?(idx)
              row_node = table_rows[idx]
              extracted_rows.push extract_row row_node
            end
        end

      output = []
      extracted_rows.each do |row|
          json_row = {}
          row.each_with_index do |el, idx|
              json_row[col_names[idx]] = el
          end

          output[json_row[key].to_i] = json_row
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
