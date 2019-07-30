#!/bin/bash
####################################################################################################
# Copyright (c) DigitalCrew and individual contributors.
#
# This source code is licensed under the MIT license found in the LICENSE file in the root directory
# of this source tree.
#
# Author: Fernando Viegas
# Project: https://github.com/DigitalCrew/auto-ver-log
####################################################################################################
#
# PURPOSE
# Automatic generator of new version and changelog file.
# It Increments the current version and updates the changelog file from the commits.
#
# ARTIFACTS
# autoVerLog.sh - The script that does the job;
# VERSION.txt - Text file with the current version;
# CHANGELOG.md - File with change information.
#
# GIT
# This script works with git version control:
# * Put tags(number of version) in commits without tags;
# * Get the log of commits;
# * Commit these changes and push to the master.
#
# COMMIT
# All commits must to be created from this text syntax: "type: message (#task)"
#   where:
#     type = Commit types: "new"(New Features), "chg"(Changed Features) and "fix"(Bug Fixes).
#            Pay attention: the beginning of the text needs to be the type, the colon and a
#            space (i.g: "new: ");
#     message = The message with phrases that may have line breaks and no list definition
#               characters;
#     task = Number that represents the commit task.
#   examples:
#     "new: Allow provided config object to extend other configs. (#73684)"
#     "fix: Correct minor typos in code. Update outdated unreleased diff link. (#1783)"
#
# VERSIONING
# We suggest the format X.Y.Z with more or less numbers (i.g: 1.2, 1.2.3, 1.2.3.4).
# When this script is run, the last number is incremented, for example, the current version is
# "1.2.3", after running this script the new version is "1.2.4" and the VERSION.txt file is updated.
####################################################################################################


##################################
# Array with commits without TAG #
##################################

# Creates a file with all commits that don't have TAGs
git log --pretty="%H %d" --decorate | grep -i -v -E "^.*\(tag:" | cut -f 1 -d ' ' > temp.txt

# Transforms the commit file into an array
IFS=$'\n' read -d '' -r -a COMMITS < temp.txt

# Deletes the temporary file
rm temp.txt

# If empty array, there isn't a new version
if [[ ${#COMMITS[@]} -eq 0 ]]; then
    echo "There isn't a new version."
    exit
fi

#####################################
# Generates the next version number #
#####################################

if [[ ! -f VERSION.txt ]]; then
    echo "The VERSION.txt file doesn't exist."
    exit
fi

# Get the current version of project
IFS=$'.' read -d '' -r -a VERSION_PARTS < VERSION.txt

# Increments the last version number and updates the file and project
VERSION=""
SIZE=${#VERSION_PARTS[@]}

for (( i = 0; i < ${#VERSION_PARTS[@]} - 1; i++ ))
do
    VERSION+="${VERSION_PARTS[i]}."
done

VERSION+=$((${VERSION_PARTS[SIZE - 1]} + 1))
echo ${VERSION} > VERSION.txt

# Creates the tag of new version for the commits
for i in "${COMMITS[@]}"
do
    git tag -a -m "New version." ${VERSION} ${i}
done

################################################
# Generates change information for new version #
################################################

# Get messages of commits grouped by type
echo "# ${VERSION} (`date +%Y-%m-%d`)" > temp.txt
echo "" >> temp.txt
declare -a TYPES=("new: " "chg: " "fix: ")
declare -a TYPES_NAMES=("New Features" "Changed Features" "Bug Fixes")
for (( i = 0; i < ${#TYPES[@]}; i++ ))
do
    echo "### ${TYPES_NAMES[i]}" >> temp.txt
    git log --pretty="*%s [%an] [%ai]" | grep -i "^*${TYPES[i]}" | sed "s/${TYPES[i]}//" >> temp.txt
    echo "" >> temp.txt
done

# Get messages of commits without types
NO_TYPE="^*(${TYPES[0]}"
for (( i = 1; i < ${#TYPES[@]}; i++ ))
do
    NO_TYPE+="|${TYPES[i]}"
done
NO_TYPE+=")"

echo "### No Type" >> temp.txt
git log --pretty="*%s [%an] [%ai]" | grep -ivE "${NO_TYPE}" >> temp.txt
echo "" >> temp.txt

# Adds the new messages at the beginning of the CHANGELOG.md file
if [[ ! -f CHANGELOG.md ]]; then
    echo "" > CHANGELOG.md
fi

cat CHANGELOG.md > temp2.txt
cat temp.txt temp2.txt > CHANGELOG.md
rm temp.txt
rm temp2.txt
echo "New generated version: ${VERSION}"

# Commits changes
git add .
git commit -m "New version."
git push -u origin master

