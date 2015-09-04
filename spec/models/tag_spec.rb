# == Schema Information
#
# Table name: tags
#
#  id         :integer          not null, primary key
#  label      :string(255)      not null
#  note_id    :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'spec_helper'

RSpec.describe Tag, :type => :model do
  let(:note_1){ Note.create }
  let(:note_2){ Note.create }
  let(:note_3){ Note.create.tap(&:become_history) }

  describe '.labels' do
    it "should return an array containing the labels of all tags" do
      expect(Tag.labels).to eq([])

      Tag.create!({label: 'one', note: note_1}, without_protection: true)
      expect(Tag.labels).to contain_exactly('one')

      Tag.create!({label: 'two', note: note_2}, without_protection: true)
      expect(Tag.labels).to contain_exactly('one', 'two')
    end

    it "should de-duplicate labels" do
      Tag.create!({label: 'one', note: note_1}, without_protection: true)
      Tag.create!({label: 'one', note: note_2}, without_protection: true)
      expect(Tag.labels).to eq(['one'])
    end

    it "should include a label for each initial section" do
      Tag.create!({label: 'one:two:three', note: note_1}, without_protection: true)
      expect(Tag.labels).to contain_exactly('one', 'one:two', 'one:two:three')
    end

    it "should order the labels alphabetically" do
      Tag.create!({label: 'one', note: note_1}, without_protection: true)
      Tag.create!({label: 'two', note: note_2}, without_protection: true)
      expect(Tag.labels).to eq(['one', 'two'])
    end

    it "should exclude tags on notes which are history" do
      Tag.create!({label: 'one', note: note_3}, without_protection: true)
      expect(Tag.labels).to eq([])
    end
  end

  describe '.autocomplete' do
    it "should return labels that match the term, ordered alphabetically" do
      Tag.create!({label: 'onetwothree', note: note_1}, without_protection: true)
      Tag.create!({label: 'one', note: note_1}, without_protection: true)
      expect(Tag.autocomplete('on')).to eq(['one', 'onetwothree'])
      expect(Tag.autocomplete('two')).to eq(['onetwothree'])
      expect(Tag.autocomplete('three')).to eq(['onetwothree'])
      expect(Tag.autocomplete('four')).to eq([])
    end

    it "shouldn't return exact matches" do
      Tag.create!({label: 'one', note: note_1}, without_protection: true)
      expect(Tag.autocomplete('one')).to eq([])
    end

    it "shouldn't match tags on notes which are history" do
      Tag.create!({label: 'one', note: note_3}, without_protection: true)
      expect(Tag.autocomplete('on')).to eq([])
    end
  end
end
