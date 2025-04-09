def set_lvar(vr, var, value):
    """Set L:Var with RPN and update local cache."""
    expr = f"{value} (> {var})"
    vr.set(expr)
    if var in vr.sim_var_name_to_id:
        vr.sim_vars[vr.sim_var_name_to_id[var]].float_value = float(value)
