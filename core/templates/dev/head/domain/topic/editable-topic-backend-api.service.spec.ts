// Copyright 2018 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Unit tests for EditableTopicBackendApiService.
 */

// TODO(#7222): Remove the following block of unnnecessary imports once
// the code corresponding to the spec is upgraded to Angular 8.
import { UpgradedServices } from 'services/UpgradedServices';
// ^^^ This block is to be removed.

require('domain/editor/undo_redo/undo-redo.service.ts');
require('domain/topic/editable-topic-backend-api.service.ts');
require('services/csrf-token.service.ts');

describe('Editable topic backend API service', function() {
  var EditableTopicBackendApiService = null;
  var sampleDataResults = null;
  var $rootScope = null;
  var $scope = null;
  var $httpBackend = null;
  var UndoRedoService = null;
  var CsrfService = null;

  beforeEach(angular.mock.module('oppia'));
  beforeEach(
    angular.mock.module('oppia', GLOBALS.TRANSLATOR_PROVIDER_FOR_TESTS));
  beforeEach(angular.mock.module('oppia', function($provide) {
    var ugs = new UpgradedServices();
    for (let [key, value] of Object.entries(ugs.upgradedServices)) {
      $provide.value(key, value);
    }
  }));

  beforeEach(angular.mock.inject(function($injector, $q) {
    EditableTopicBackendApiService = $injector.get(
      'EditableTopicBackendApiService');
    UndoRedoService = $injector.get('UndoRedoService');
    $rootScope = $injector.get('$rootScope');
    $scope = $rootScope.$new();
    $httpBackend = $injector.get('$httpBackend');
    CsrfService = $injector.get('CsrfTokenService');

    spyOn(CsrfService, 'getTokenAsync').and.callFake(function() {
      var deferred = $q.defer();
      deferred.resolve('sample-csrf-token');
      return deferred.promise;
    });

    // Sample topic object returnable from the backend
    sampleDataResults = {
      topic_dict: {
        id: '0',
        name: 'Topic Name',
        description: 'Topic Description',
        version: '1',
        canonical_story_references: [{
          story_id: 'story_1',
          story_is_published: true
        }],
        additional_story_references: [{
          story_id: 'story_2',
          story_is_published: true
        }],
        uncategorized_skill_ids: ['skill_id_1'],
        subtopics: [],
        language_code: 'en'
      },
      skill_id_to_description_dict: {
        skill_id_1: 'Description 1'
      },
      skill_id_to_rubrics_dict: {
        skill_id_1: []
      },
      subtopic_page: {
        id: 'topicId-1',
        topicId: 'topicId',
        page_contents: {
          subtitled_html: {
            html: '<p>Data</p>',
            content_id: 'content'
          },
          recorded_voiceovers: {
            voiceovers_mapping: {
              content: {}
            }
          },
        },
        language_code: 'en'
      }
    };
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should successfully fetch an existing topic from the backend',
    function() {
      var successHandler = jasmine.createSpy('success');
      var failHandler = jasmine.createSpy('fail');

      $httpBackend.expect('GET', '/topic_editor_handler/data/0').respond(
        sampleDataResults);
      EditableTopicBackendApiService.fetchTopic('0').then(
        successHandler, failHandler);
      $httpBackend.flush();

      expect(successHandler).toHaveBeenCalledWith({
        topicDict: sampleDataResults.topic_dict,
        skillIdToDescriptionDict:
          sampleDataResults.skill_id_to_description_dict,
        skillIdToRubricsDict: sampleDataResults.skill_id_to_rubrics_dict
      });
      expect(failHandler).not.toHaveBeenCalled();
    }
  );

  it('should successfully fetch an existing subtopic page from the backend',
    function() {
      var successHandler = jasmine.createSpy('success');
      var failHandler = jasmine.createSpy('fail');

      $httpBackend.expect(
        'GET', '/subtopic_page_editor_handler/data/topicId/1').respond(
        sampleDataResults);
      EditableTopicBackendApiService.fetchSubtopicPage('topicId', 1).then(
        successHandler, failHandler);
      $httpBackend.flush();

      expect(successHandler).toHaveBeenCalledWith(
        sampleDataResults.subtopic_page);
      expect(failHandler).not.toHaveBeenCalled();
    }
  );

  it('should use the rejection handler if the backend request failed',
    function() {
      var successHandler = jasmine.createSpy('success');
      var failHandler = jasmine.createSpy('fail');

      $httpBackend.expect('GET', '/topic_editor_handler/data/1').respond(
        500, 'Error loading topic 1.');
      EditableTopicBackendApiService.fetchTopic('1').then(
        successHandler, failHandler);
      $httpBackend.flush();

      expect(successHandler).not.toHaveBeenCalled();
      expect(failHandler).toHaveBeenCalledWith('Error loading topic 1.');
    }
  );

  it('should update a topic after fetching it from the backend',
    function() {
      var successHandler = jasmine.createSpy('success');
      var failHandler = jasmine.createSpy('fail');
      var topic = null;

      // Loading a topic the first time should fetch it from the backend.
      $httpBackend.expect('GET', '/topic_editor_handler/data/0').respond(
        sampleDataResults);

      EditableTopicBackendApiService.fetchTopic('0').then(
        function(data) {
          topic = data.topicDict;
        });
      $httpBackend.flush();

      topic.name = 'New Name';
      topic.version = '2';
      var topicWrapper = {
        topic_dict: topic,
        skill_id_to_description_dict: {
          skill_id_1: 'Description 1'
        },
        skill_id_to_rubrics_dict: []
      };

      $httpBackend.expect('PUT', '/topic_editor_handler/data/0').respond(
        topicWrapper);

      // Send a request to update topic
      EditableTopicBackendApiService.updateTopic(
        topic.id, topic.version, 'Name is updated', []
      ).then(successHandler, failHandler);
      $httpBackend.flush();

      expect(successHandler).toHaveBeenCalledWith({
        topicDict: topic,
        skillIdToDescriptionDict: topicWrapper.skill_id_to_description_dict,
        skillIdToRubricsDict: topicWrapper.skill_id_to_rubrics_dict
      });
      expect(failHandler).not.toHaveBeenCalled();
    }
  );

  it('should use the rejection handler if the topic to update doesn\'t exist',
    function() {
      var successHandler = jasmine.createSpy('success');
      var failHandler = jasmine.createSpy('fail');

      // Loading a topic the first time should fetch it from the backend.
      $httpBackend.expect('PUT', '/topic_editor_handler/data/1').respond(
        404, 'Topic with given id doesn\'t exist.');

      EditableTopicBackendApiService.updateTopic(
        '1', '1', 'Update an invalid topic.', []
      ).then(successHandler, failHandler);
      $httpBackend.flush();

      expect(successHandler).not.toHaveBeenCalled();
      expect(failHandler).toHaveBeenCalledWith(
        'Topic with given id doesn\'t exist.');
    }
  );
});
