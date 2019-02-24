//@flow
import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";

const styles = theme => ({
    root: {
        width: "90%",
    },
    backButton: {
        marginRight: theme.spacing.unit,
    },
    instructions: {
        marginTop: theme.spacing.unit,
        marginBottom: theme.spacing.unit,
    },
});

function getSteps() {
    return ["Ajouter des fichiers", "Choisir les recettes", "Résultat"];
}

class AppStepper extends React.PureComponent<{
    activeStep: number,
    classes: any,
}> {
    render() {
        const { classes, activeStep } = this.props;
        const steps = getSteps();

        return (
            <div className={classes.root}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map(label => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </div>
        );
    }
}

export default withStyles(styles)(AppStepper);
