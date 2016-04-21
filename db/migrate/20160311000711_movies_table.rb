class MoviesTable < ActiveRecord::Migration
  def change
      create_table :movies do |t|
          t.jsonb :api_data
          t.string :title
          t.timestamps null: false
      end

      add_index :movies, :title, :unique => true

      add_index :weekly_revenues, [:year, :week], :unique => true
      rename_column :weekly_revenues, :revenue, :api_data
  end
end
