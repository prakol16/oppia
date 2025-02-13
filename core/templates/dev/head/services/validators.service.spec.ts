// Copyright 2014 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Unit tests for Validators Service.
 */

// TODO(#7222): Remove the following block of unnnecessary imports once
// the code corresponding to the spec is upgraded to Angular 8.
import { UpgradedServices } from 'services/UpgradedServices';
// ^^^ This block is to be removed.

require('services/validators.service.ts');

describe('Validators service', function() {
  beforeEach(angular.mock.module('oppia'));
  beforeEach(angular.mock.module('oppia', function($provide) {
    var ugs = new UpgradedServices();
    for (let [key, value] of Object.entries(ugs.upgradedServices)) {
      $provide.value(key, value);
    }
  }));

  describe('validators service', function() {
    beforeEach(angular.mock.module(function($provide) {
      $provide.constant('INVALID_NAME_CHARS', '#xyz');
    }));

    var vs = null;

    beforeEach(angular.mock.inject(function($injector) {
      vs = $injector.get('ValidatorsService');
    }));

    it('should correctly validate entity names', function() {
      expect(vs.isValidEntityName('b')).toBe(true);
      expect(vs.isValidEntityName('b   ')).toBe(true);
      expect(vs.isValidEntityName('   b')).toBe(true);
      expect(vs.isValidEntityName('bd')).toBe(true);

      expect(vs.isValidEntityName('')).toBe(false);
      expect(vs.isValidEntityName('   ')).toBe(false);
      expect(vs.isValidEntityName('x')).toBe(false);
      expect(vs.isValidEntityName('y')).toBe(false);
      expect(vs.isValidEntityName('bx')).toBe(false);
    });

    it('should correctly validate exploration titles', function() {
      expect(vs.isValidExplorationTitle('b')).toBe(true);
      expect(vs.isValidExplorationTitle('abc def')).toBe(true);

      expect(vs.isValidExplorationTitle('')).toBe(false);
      expect(vs.isValidExplorationTitle(null)).toBe(false);
      expect(vs.isValidExplorationTitle(undefined)).toBe(false);
      expect(vs.isValidExplorationTitle(
        'A title with invalid characters #')).toBe(false);
      expect(vs.isValidExplorationTitle(
        'A title that is toooooooooooooooooooooooooo too long.')).toBe(false);
    });

    it('should correctly validate non-emptiness', function() {
      expect(vs.isNonempty('b')).toBe(true);
      expect(vs.isNonempty('abc def')).toBe(true);

      expect(vs.isNonempty('')).toBe(false);
      expect(vs.isNonempty(null)).toBe(false);
      expect(vs.isNonempty(undefined)).toBe(false);
    });

    it('should correctly validate exploration IDs', function() {
      expect(vs.isValidExplorationId('b')).toBe(true);
      expect(vs.isValidExplorationId('2')).toBe(true);
      expect(vs.isValidExplorationId('asbfjkdAFS-_')).toBe(true);

      expect(vs.isValidExplorationId('abc def')).toBe(false);
      expect(vs.isValidExplorationId('')).toBe(false);
      expect(vs.isValidExplorationId('abcd;')).toBe(false);
    });
  });
});
