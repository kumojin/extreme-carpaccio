Feature: Display history

    Scenario: Display history
        Given I'm on the website
        When There are 100 iterations
        Then the chart is visible 'chart-100-iteration-2s'


    Scenario: Display history
        Given I'm on the website
        When There are 200 iterations
        Then the chart is visible 'chart-200-iteration-2'

