require 'spec_helper'

describe Note do
  describe '#tag_list' do
    it 'should equal the comma separated list of tags' do
      note = Note.create!(:body => 'whatever')
      note.tags.create!(:label => 'one')
      note.tags.create!(:label => 'two')
      note.tags.create!(:label => 'three')
      note.tag_list.should eq('one, two, three')
    end
  end


  describe '#tag_list=' do
    it 'should split the argument by comma and build a tag for each item' do
      Note.new.tap{ |n| n.tag_list = '' }.tag_list.should eq('')
      Note.new.tap{ |n| n.tag_list = 'one' }.tag_list.should eq('one')
      Note.new.tap{ |n| n.tag_list = 'one, two' }.tag_list.should eq('one, two')
      Note.new.tap{ |n| n.tag_list = 'one, two, three' }.tag_list.should eq('one, two, three')
    end

    it 'should override all old tags' do
      note = Note.create!(:body => 'whatever')
      note.tags.create!(:label => 'one')
      note.tags.create!(:label => 'two')
      note.tags.create!(:label => 'three')
      note.tag_list = 'uno, dos, tres'
      note.tag_list.should eq('uno, dos, tres')
      note.save
      Note.find(note.id).tag_list.should eq('uno, dos, tres')
    end
  end
end
