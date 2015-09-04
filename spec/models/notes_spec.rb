require 'spec_helper'

RSpec.describe Note do
  describe '#tag_list' do
    it 'should equal the comma separated list of tags' do
      note = Note.create!(:body => 'whatever')
      note.tags.create!(:label => 'one')
      note.tags.create!(:label => 'two')
      note.tags.create!(:label => 'three')
      expect(note.tag_list).to eq('one, two, three')
    end
  end

  describe '#tag_list=' do
    it 'should split the argument by comma and build a tag for each item' do
      expect( Note.new.tap{ |n| n.tag_list = '' }.tag_list ).
        to eq('')
      expect( Note.new.tap{ |n| n.tag_list = 'one' }.tag_list ).
        to eq('one')
      expect( Note.new.tap{ |n| n.tag_list = 'one, two' }.tag_list ).
        to eq('one, two')
      expect( Note.new.tap{ |n| n.tag_list = 'one, two, three' }.tag_list ).
        to eq('one, two, three')
    end

    it 'should override all old tags' do
      note = Note.create!(:body => 'whatever')
      note.tags.create!(:label => 'one')
      note.tags.create!(:label => 'two')
      note.tags.create!(:label => 'three')
      note.tag_list = 'uno, dos, tres'
      expect( note.tag_list ).to eq('uno, dos, tres')
      note.save!
      expect( Note.find(note.id).tag_list ).to eq('uno, dos, tres')
    end
  end

  describe '#save' do
    it "should save a copy in versions when updating a note" do
      note = Note.create!(:title => 't', :body => 'b', :date => Time.at(1))

      note = Note.find(note.id)
      note.title = 'title'
      note.save!

      expect( note.versions.count ).to eq(1)

      copy = note.versions.take!
      expect([copy.title, copy.body, copy.date]).to eq(['t', 'b', Time.at(1)])
    end

    it "should not save a copy in versions if there are no changes" do
      note = Note.create!(:title => 't', :body => 'b', :date => Time.at(1))

      note = Note.find(note.id)
      note.title = "#{note.title}"
      note.save!

      expect( note.versions.count ).to eq(0)
    end
  end
end
