class CreateWeeklyRevenues < ActiveRecord::Migration
    def change
      create_table :weekly_revenues do |t|
          t.jsonb :revenue
          t.integer :year
          t.integer :week
          t.timestamps null: false
      end
    end

    

end
